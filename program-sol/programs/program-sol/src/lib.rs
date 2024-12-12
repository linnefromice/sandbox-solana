use anchor_lang::prelude::*;

declare_id!("3FbrHy2HRjGVCDgQbzpoRaHAZUqyGLL3UVrhuX9U75tX");

#[program]
pub mod program_sol {
    use super::*;

    pub fn init_program(ctx: Context<InitializeProgram>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn init_user(ctx: Context<InitializeUser>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProgram {}

#[derive(Accounts)]
pub struct InitializeUser {}

#[derive(Accounts)]
pub struct Deposit {}

#[derive(Accounts)]
pub struct Withdraw {}
