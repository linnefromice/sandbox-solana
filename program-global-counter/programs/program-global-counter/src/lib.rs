use anchor_lang::prelude::*;

declare_id!("38iBYy8JAKBtjce1RAF2VpoRksUiFLghNDkmgDwJGMR6");

#[program]
pub mod program_global_counter {
    use super::*;

    pub fn init_program(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn add(ctx: Context<Add>, data: Data) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn sub(ctx: Context<Sub>, data: Data) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Add {}

#[derive(Accounts)]
pub struct Sub {}

#[account]
pub struct Data {}