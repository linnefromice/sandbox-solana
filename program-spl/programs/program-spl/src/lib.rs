use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("8yYTuH1jM6dJhUt2UrYkiiAn5XpZ7op9x2oZD3zXSBGm");

#[program]
pub mod program_spl {
    use super::*;

    pub fn hello(_ctx: Context<Hello>) -> Result<String> {
        let msg = "Hello,world!".to_string();
        msg!(&msg);
        Ok(msg)
    }

    pub fn transfer_to_user(ctx: Context<TransferSplToUser>, amount: u64) -> Result<()> {
        let dst = &ctx.accounts.to_token_account;
        let src = &ctx.accounts.from_token_account;
        let token_program = &ctx.accounts.token_program;
        let authority = &ctx.accounts.from;
        let cpi_accounts = token::Transfer {
            from: src.to_account_info().clone(),
            to: dst.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };
        let cpi_program = token_program.to_account_info();

        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}

#[derive(Accounts)]
pub struct TransferSplToUser<'info> {
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    pub to_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// NOTE: for AssociatedTokenAccount (incomplete)
// #[derive(Accounts)]
// pub struct TransferSplToUser<'info> {
//     pub from: Signer<'info>,
//     pub to: SystemAccount<'info>,
//     #[account(
//         mut,
//         constraint = mint_account.key() == from_ata.mint
//     )]
//     pub mint_account: Account<'info, Mint>,
//     #[account(
//         mut,
//         constraint = from_ata.owner == from.key(),
//         constraint = from_ata.mint == mint_account.key()
//     )]
//     pub from_ata: Account<'info, TokenAccount>,
//     #[account(
//         mut,
//         constraint = to_ata.owner == to.key(),
//         constraint = to_ata.mint == mint_account.key()
//     )]
//     pub to_ata: Account<'info, TokenAccount>,
//     pub token_program: Program<'info, Token>,
// }
